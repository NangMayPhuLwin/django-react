from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Create a normal user"

    def add_arguments(self, parser):
        parser.add_argument("--username", default="testuser")
        parser.add_argument("--password", default="testuser123")
        parser.add_argument("--email", default="")

    def handle(self, *args, **options):
        username = options["username"]
        password = options["password"]
        email = options["email"]

        if User.objects.filter(username=username).exists():
            raise CommandError(f"User '{username}' already exists.")

        User.objects.create_user(
            username=username,
            password=password,
            email=email,
        )
        self.stdout.write(self.style.SUCCESS(f"User '{username}' created."))