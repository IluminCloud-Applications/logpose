import stripe


def get_stripe_client(api_key: str) -> stripe.StripeClient:
    """Cria e retorna um cliente Stripe com a API key fornecida."""
    return stripe.StripeClient(api_key=api_key)


def validate_stripe_key(api_key: str) -> bool:
    """Valida se a API key do Stripe é válida tentando listar 1 customer."""
    try:
        client = get_stripe_client(api_key)
        client.customers.list(params={"limit": 1})
        return True
    except stripe.AuthenticationError:
        return False
    except Exception:
        return False
