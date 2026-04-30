import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrigov.settings')
django.setup()

from apps.users.models import User

def delete_pending_users():
    names_to_delete = ['Farmer User', 'imene ben', 'Samir the Transporter', 'Mehdi the Buyer', 'Ahmed the Farmer']
    deleted_count = 0
    for name in names_to_delete:
        # Only delete if they are NOT validated
        res = User.objects.filter(name=name, is_validated=False).delete()
        deleted_count += res[0]
    
    print(f"Deleted {deleted_count} pending users.")

if __name__ == '__main__':
    delete_pending_users()
