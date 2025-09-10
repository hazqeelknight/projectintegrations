"""
Views for integrations module with OAuth flow handling.
"""
import json
import logging
import uuid
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import requests
import urllib.parse

from .models import CalendarIntegration, VideoConferenceIntegration, WebhookIntegration, IntegrationLog
from .serializers import (
    CalendarIntegrationSerializer,
    VideoConferenceIntegrationSerializer,
    WebhookIntegrationSerializer,
    IntegrationLogSerializer,
    OAuthInitiateSerializer,
    OAuthCallbackSerializer,
)
from .utils import (
    create_integration_health_report,
    detect_integration_conflicts,
    log_integration_activity,
    get_provider_scopes,
)

logger = logging.getLogger(__name__)


# Calendar Integration Views
class CalendarIntegrationListView(generics.ListAPIView):
    """List calendar integrations for the authenticated user."""
    serializer_class = CalendarIntegrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CalendarIntegration.objects.filter(organizer=self.request.user)


class CalendarIntegrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a calendar integration."""
    serializer_class = CalendarIntegrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CalendarIntegration.objects.filter(organizer=self.request.user)


# Video Conference Integration Views
class VideoConferenceIntegrationListView(generics.ListAPIView):
    """List video conference integrations for the authenticated user."""
    serializer_class = VideoConferenceIntegrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VideoConferenceIntegration.objects.filter(organizer=self.request.user)


class VideoConferenceIntegrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a video conference integration."""
    serializer_class = VideoConferenceIntegrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VideoConferenceIntegration.objects.filter(organizer=self.request.user)


# Webhook Integration Views
class WebhookIntegrationListCreateView(generics.ListCreateAPIView):
    """List and create webhook integrations."""
    serializer_class = WebhookIntegrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WebhookIntegration.objects.filter(organizer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class WebhookIntegrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a webhook integration."""
    serializer_class = WebhookIntegrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WebhookIntegration.objects.filter(organizer=self.request.user)


# Integration Logs View
class IntegrationLogListView(generics.ListAPIView):
    """List integration logs for the authenticated user."""
    serializer_class = IntegrationLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = IntegrationLog.objects.filter(organizer=self.request.user)
        
        # Apply filters
        log_type = self.request.query_params.get('log_type')
        integration_type = self.request.query_params.get('integration_type')
        success = self.request.query_params.get('success')
        
        if log_type:
            queryset = queryset.filter(log_type=log_type)
        if integration_type:
            queryset = queryset.filter(integration_type=integration_type)
        if success is not None:
            queryset = queryset.filter(success=success.lower() == 'true')
        
        return queryset.order_by('-created_at')


# OAuth Flow Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_oauth(request):
    """Initiate OAuth flow for integrations."""
    serializer = OAuthInitiateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    provider = serializer.validated_data['provider']
    integration_type = serializer.validated_data['integration_type']
    redirect_uri = serializer.validated_data['redirect_uri']
    
    try:
        # Generate state parameter for security
        state = f"{provider}:{integration_type}:{uuid.uuid4().hex}"
        
        # Store state in session for validation
        request.session[f'oauth_state_{provider}_{integration_type}'] = state
        
        # Get required scopes
        scopes = get_provider_scopes(provider, integration_type)
        
        if provider == 'google':
            auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode({
                'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
                'redirect_uri': redirect_uri,
                'scope': ' '.join(scopes),
                'response_type': 'code',
                'access_type': 'offline',
                'prompt': 'consent',
                'state': state,
            })
        elif provider == 'outlook':
            auth_url = f'https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?' + urllib.parse.urlencode({
                'client_id': settings.MICROSOFT_CLIENT_ID,
                'redirect_uri': redirect_uri,
                'scope': ' '.join(scopes),
                'response_type': 'code',
                'state': state,
            })
        elif provider == 'zoom':
            auth_url = 'https://zoom.us/oauth/authorize?' + urllib.parse.urlencode({
                'client_id': settings.ZOOM_CLIENT_ID,
                'redirect_uri': redirect_uri,
                'response_type': 'code',
                'state': state,
            })
        else:
            return Response(
                {'error': f'Provider {provider} not supported'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'authorization_url': auth_url,
            'provider': provider,
            'integration_type': integration_type,
            'state': state,
        })
        
    except Exception as e:
        logger.error(f"Error initiating OAuth for {provider}: {str(e)}")
        return Response(
            {'error': 'Failed to initiate OAuth flow'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def oauth_callback(request):
    """Handle OAuth callback and create integration."""
    serializer = OAuthCallbackSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    provider = serializer.validated_data['provider']
    integration_type = serializer.validated_data['integration_type']
    code = serializer.validated_data['code']
    state = serializer.validated_data.get('state')
    
    try:
        # Validate state parameter
        expected_state = request.session.get(f'oauth_state_{provider}_{integration_type}')
        if not expected_state or state != expected_state:
            return Response(
                {'error': 'Invalid state parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Exchange code for tokens
        token_data = exchange_oauth_code(provider, code, request.data.get('redirect_uri'))
        
        # Get user info from provider
        user_info = get_provider_user_info(provider, token_data['access_token'])
        
        # Create or update integration
        if integration_type == 'calendar':
            integration, created = CalendarIntegration.objects.update_or_create(
                organizer=request.user,
                provider=provider,
                defaults={
                    'access_token': token_data['access_token'],
                    'refresh_token': token_data.get('refresh_token', ''),
                    'token_expires_at': timezone.now() + timedelta(seconds=token_data.get('expires_in', 3600)),
                    'provider_user_id': user_info.get('id', ''),
                    'provider_email': user_info.get('email', ''),
                    'is_active': True,
                    'sync_enabled': True,
                    'sync_errors': 0,
                }
            )
        else:  # video
            integration, created = VideoConferenceIntegration.objects.update_or_create(
                organizer=request.user,
                provider=provider,
                defaults={
                    'access_token': token_data['access_token'],
                    'refresh_token': token_data.get('refresh_token', ''),
                    'token_expires_at': timezone.now() + timedelta(seconds=token_data.get('expires_in', 3600)),
                    'provider_user_id': user_info.get('id', ''),
                    'provider_email': user_info.get('email', ''),
                    'is_active': True,
                    'auto_generate_links': True,
                }
            )
        
        # Log the activity
        log_integration_activity(
            organizer=request.user,
            log_type='oauth_connected',
            integration_type=provider,
            message=f"{provider.title()} {integration_type} integration {'created' if created else 'updated'}",
            success=True,
            details={
                'provider_email': user_info.get('email', ''),
                'created': created,
            }
        )
        
        # Clear session state
        request.session.pop(f'oauth_state_{provider}_{integration_type}', None)
        
        return Response({
            'message': f'{provider.title()} {integration_type} integration connected successfully',
            'provider': provider,
            'integration_type': integration_type,
            'provider_email': user_info.get('email', ''),
            'created': created,
        })
        
    except Exception as e:
        logger.error(f"Error in OAuth callback for {provider}: {str(e)}")
        return Response(
            {'error': f'Failed to complete OAuth flow: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def exchange_oauth_code(provider, code, redirect_uri):
    """Exchange OAuth authorization code for access token."""
    if provider == 'google':
        token_url = 'https://oauth2.googleapis.com/token'
        data = {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
        }
    elif provider == 'outlook':
        token_url = f'https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/token'
        data = {
            'client_id': settings.MICROSOFT_CLIENT_ID,
            'client_secret': settings.MICROSOFT_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
        }
    elif provider == 'zoom':
        token_url = 'https://zoom.us/oauth/token'
        data = {
            'client_id': settings.ZOOM_CLIENT_ID,
            'client_secret': settings.ZOOM_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
        }
    else:
        raise ValueError(f'Unsupported provider: {provider}')
    
    response = requests.post(token_url, data=data, timeout=30)
    
    if response.status_code != 200:
        raise Exception(f'Token exchange failed: {response.text}')
    
    return response.json()


def get_provider_user_info(provider, access_token):
    """Get user information from OAuth provider."""
    headers = {'Authorization': f'Bearer {access_token}'}
    
    if provider == 'google':
        response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers=headers,
            timeout=30
        )
    elif provider == 'outlook':
        response = requests.get(
            'https://graph.microsoft.com/v1.0/me',
            headers=headers,
            timeout=30
        )
    elif provider == 'zoom':
        response = requests.get(
            'https://api.zoom.us/v2/users/me',
            headers=headers,
            timeout=30
        )
    else:
        raise ValueError(f'Unsupported provider: {provider}')
    
    if response.status_code != 200:
        raise Exception(f'Failed to get user info: {response.text}')
    
    return response.json()


# Additional Integration Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_calendar_sync(request, pk):
    """Refresh calendar sync for a specific integration."""
    try:
        integration = CalendarIntegration.objects.get(
            id=pk,
            organizer=request.user
        )
        
        from .tasks import sync_calendar_events
        sync_calendar_events.delay(integration.id)
        
        return Response({
            'message': 'Calendar sync refresh initiated'
        })
        
    except CalendarIntegration.DoesNotExist:
        return Response(
            {'error': 'Calendar integration not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def force_calendar_sync(request, pk):
    """Force calendar sync for a specific integration."""
    try:
        integration = CalendarIntegration.objects.get(
            id=pk,
            organizer=request.user
        )
        
        from .tasks import sync_calendar_events
        sync_calendar_events.delay(integration.id)
        
        return Response({
            'message': 'Force calendar sync initiated'
        })
        
    except CalendarIntegration.DoesNotExist:
        return Response(
            {'error': 'Calendar integration not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_webhook(request, pk):
    """Test a webhook integration."""
    try:
        webhook = WebhookIntegration.objects.get(
            id=pk,
            organizer=request.user
        )
        
        # Send test webhook
        from .tasks import send_webhook
        test_data = {
            'timestamp': timezone.now().isoformat(),
            'test': True,
            'organizer_email': request.user.email,
        }
        
        send_webhook.delay(webhook.id, 'test_event', test_data)
        
        return Response({
            'message': 'Test webhook sent successfully'
        })
        
    except WebhookIntegration.DoesNotExist:
        return Response(
            {'error': 'Webhook integration not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def integration_health(request):
    """Get integration health report for the authenticated user."""
    try:
        health_report = create_integration_health_report(request.user)
        return Response(health_report)
        
    except Exception as e:
        logger.error(f"Error generating health report: {str(e)}")
        return Response(
            {'error': 'Failed to generate health report'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendar_conflicts(request):
    """Get calendar conflicts analysis."""
    try:
        from apps.availability.models import BlockedTime
        
        # Get manual blocked times
        manual_blocks = BlockedTime.objects.filter(
            organizer=request.user,
            source='manual',
            is_active=True
        )
        
        # Get synced blocked times
        synced_blocks = BlockedTime.objects.filter(
            organizer=request.user,
            source__in=['google_calendar', 'outlook_calendar', 'apple_calendar'],
            is_active=True
        )
        
        # Convert synced blocks to external events format for conflict detection
        external_events = []
        for block in synced_blocks:
            external_events.append({
                'external_id': block.external_id or str(block.id),
                'summary': block.reason,
                'start_datetime': block.start_datetime,
                'end_datetime': block.end_datetime,
                'updated': block.updated_at,
            })
        
        # Detect conflicts
        conflict_analysis = detect_integration_conflicts(
            request.user,
            external_events,
            manual_blocks
        )
        
        # Add summary statistics
        conflict_analysis.update({
            'manual_blocks_count': manual_blocks.count(),
            'synced_blocks_count': synced_blocks.count(),
        })
        
        return Response(conflict_analysis)
        
    except Exception as e:
        logger.error(f"Error analyzing calendar conflicts: {str(e)}")
        return Response(
            {'error': 'Failed to analyze calendar conflicts'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )