from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from apps.users.models import User

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).order_by('-updated_at')

    @action(detail=False, methods=['post'])
    def start_conversation(self, request):
        participant_id = request.data.get('participant_id')
        order_id = request.data.get('order_id')
        
        if not participant_id:
            return Response({"error": "Participant ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            other_user = User.objects.get(id_user=participant_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if other_user == request.user:
            return Response({"error": "Cannot start conversation with yourself"}, status=status.HTTP_400_BAD_REQUEST)

        # Find existing conversation between these 2 users
        # We look for conversations that have exactly these two participants
        conversation = Conversation.objects.filter(participants=request.user).filter(participants=other_user).annotate(num_participants=Count('participants')).filter(num_participants=2).first()

        if not conversation:
            conversation = Conversation.objects.create(order_id=order_id)
            conversation.participants.add(request.user, other_user)
        elif order_id and not conversation.order:
            # Optionally update order if it's missing
            conversation.order_id = order_id
            conversation.save()

        serializer = self.get_serializer(conversation)
        return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(conversation__participants=self.request.user)

    def perform_create(self, serializer):
        conversation_id = self.request.data.get('conversation')
        try:
            conversation = Conversation.objects.get(id_conversation=conversation_id, participants=self.request.user)
            serializer.save(sender=self.request.user, conversation=conversation)
            # Update conversation timestamp
            conversation.save() 
        except Conversation.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You are not a participant in this conversation.")
