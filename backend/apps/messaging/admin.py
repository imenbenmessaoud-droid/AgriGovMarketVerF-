from django.contrib import admin
from .models import Conversation, Message

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id_conversation', 'order', 'created_at', 'updated_at')
    filter_horizontal = ('participants',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id_message', 'conversation', 'sender', 'created_at', 'is_read')
    list_filter = ('conversation', 'sender', 'is_read')
