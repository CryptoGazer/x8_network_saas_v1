# X8 Network SaaS

---
- *Version: 1*

## n8n

---
### Workflows

### Supabase
#### StripeWA_Sessions
*actually not only WhatsApp, it was named so initially*

**Tables**
- wa_sessions *(WA and TG)*
- wa_buffer_messages *(WA and TG)*
- sessions_statuses *(all social networks + Email)*

##### sessions_statuses
**ENUM for payment_status**
- no_payment_link *(default value)*
- payment_link_sent *(each time a new payment link is sent)*
- paid *(when a payment link is paid, this status appears. It remains until this client doesn't initiate a new order)*
