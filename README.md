📡 NetStream - ISP Billing & Subscriber Management App
A responsive React web application designed for Internet Service Providers (ISPs) to manage subscribers, process onboardings, monitor connection statuses, and handle billing/invoices.

## Architecture

- `src/` contains the React frontend.
- `backend/` contains the FastAPI API and SQLAlchemy PostgreSQL models.
- `docker-compose.yml` starts PostgreSQL for local development.

See [backend/README.md](backend/README.md) to run the API. The frontend configuration accepts `VITE_API_BASE_URL` for the backend address.

✨ Features
Subscriber Onboarding: Capture customer contact info, installation address, and internet speed tier.

Onboarding Queue & Provisioning: View non-activated customers and assign static IP addresses to transition them to active status.

Account Controls: Instantly toggle subscriber status between Active and Suspended to manage access.

Billing & Invoices: Track outstanding balances, overdue accounts, and record payments.

Operations Dashboard: Quick metrics for active lines, suspended accounts, and pending onboardings.
