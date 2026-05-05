from rest_framework import serializers
from .models import Conversation, Message
from apps.users.models import User

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id_user', 'name', 'user_type', 'avatar', 'phone', 'email', 'wilaya']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    sender_role = serializers.CharField(source='sender.user_type', read_only=True)
    sender_avatar = serializers.CharField(source='sender.avatar', read_only=True)

    class Meta:
        model = Message
        fields = ['id_message', 'conversation', 'sender', 'sender_name', 'sender_role', 'sender_avatar', 'content', 'created_at', 'is_read']
        read_only_fields = ['sender', 'created_at']

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSimpleSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id_conversation', 'order', 'participants', 'created_at', 'updated_at', 'last_message', 'other_participant']

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user:
            other = obj.participants.exclude(id_user=request.user.id_user).first()
            if other:
                return UserSimpleSerializer(other).data
        return None
