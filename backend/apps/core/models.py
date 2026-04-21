from django.db import models
from django.utils import timezone


class BaseModel(models.Model):
    """
    Modèle de base avec champs communs
    """
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class ActiveModel(BaseModel):
    """
    Modèle avec champ is_active
    """
    is_active = models.BooleanField(default=True)
    
    class Meta:
        abstract = True
    
    def activate(self):
        self.is_active = True
        self.save()
        return self
    
    def deactivate(self):
        self.is_active = False
        self.save()
        return self


class ValidatedModel(BaseModel):
    """
    Modèle avec champ is_validated
    """
    is_validated = models.BooleanField(default=False)
    validated_at = models.DateTimeField(null=True, blank=True)
    validated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_validated'
    )
    
    class Meta:
        abstract = True
    
    def validate(self, by_user=None):
        self.is_validated = True
        self.validated_at = timezone.now()
        if by_user:
            self.validated_by = by_user
        self.save()
        return self


class TimestampModel(models.Model):
    """
    Modèle avec timestamps
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True