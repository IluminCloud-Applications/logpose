"""
Emails de teste usados pelas plataformas de pagamento.
Webhooks com esses emails são ignorados para não contaminar os dados.
"""

TEST_EMAILS = {
    "yoda@testsuser.com",   # PayT test email
    "johndoe@example.com",  # Kiwify test email
}


def is_test_email(email: str | None) -> bool:
    """Retorna True se o email pertence a uma conta de teste."""
    if not email:
        return False
    return email.strip().lower() in TEST_EMAILS
