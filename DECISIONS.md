# Decisions

## Product Thinking

My first approach was to think about the problem from a user point of view. If I were the user, what would I actually need? I used my own subscriptions as inspiration and added three features that felt essential but weren’t explicitly in the instructions: login/register, free trials and custom billing cycles (e.g., every 3 months or every 14 days).

## Architecture Decisions

### Backend

I used Django + Django REST Framework, as recommended in the instructions. I’ve used Django once before, and while there was a small learning curve, my Python/Flask background helped. I chose a monolithic architecture because Django provides batteries-included features (ORM, admin, auth), which reduce external dependencies and are ideal for a solo developer. It’s also production-ready at a small scale.

The following is how my backend is structured:  
<img width="313" height="659" alt="image" src="https://github.com/user-attachments/assets/3b8621c2-0367-4c15-a3a7-d7a9724aed00" />

User input validation is done within `serializers.py`. The routes are defined in `core/urls.py`, while the endpoints are in `subscriptions/views.py`. The basic CRUD endpoints are implemented via DRF viewsets (using `queryset` + `serializer_class`), and the remaining endpoints (login/register, etc.) are written by me. I initially tested the APIs using the auto-generated OpenAPI docs (Swagger UI/ReDoc) at `/api/docs`, which let me try requests and inspect request/response schemas before finishing up the frontend.

### Database

For the database, I went with the default SQLite. I considered PostgreSQL (better for production), but chose SQLite to simplify reviewer setup, as they might not have PostgreSQL installed.
As for why I did not choose a NoSQL database, I felt like this application was more suited for a tabular format rather than a document format.

#### Data Model Design

I designed a single `Subscription` model that handles all the core requirements plus my additional features:

**Core Fields:**

- `owner` (ForeignKey): Links subscriptions to users - I used Django's AUTH_USER_MODEL for flexibility
- `service_name`, `cost`, `billing_cycle`: Basic subscription info as required
- `start_date`, `renewal_date`: For tracking renewal cycles
- `is_active`: For soft deletion instead of hard deletes (better for data integrity)

**Extended Features I Added:**

- **Custom billing cycles**: Added `custom_interval_unit` and `custom_interval_value` fields to support "every 3 months" or "every 14 days" scenarios that real users need
- **Free trial support**: `has_free_trial` and `trial_end_date` fields because many subscriptions start with trials
- **Categorization**: `category` with predefined choices plus `custom_category` for flexibility
- **Notes field**: For user context (why they have this subscription, etc.)

**Key Design Decisions:**

1. **Single table approach**: I considered separate models for different billing types but chose one model with optional fields for simplicity and performance
2. **Soft deletes**: `is_active` flag instead of deleting records because users might want to see historical data. The users still have the option to delete a subscription permanently
3. **Decimal for cost**: Using `DecimalField` instead of `FloatField` to avoid floating-point precision issues with money
4. **Choice fields**: Used Django choices for validation and consistent data entry
5. **Foreign key relationship**: One-to-many between User and Subscription with CASCADE delete

**Property Methods:**

- `in_trial_now`: Calculated property to check if subscription is currently in free trial period

**Trade-offs Made:**

- Single model vs multiple models: Chose single for simplicity, though it means some fields are nullable
- SQLite vs PostgreSQL: SQLite for ease of setup, though PostgreSQL would be better for production with concurrent users
- Soft vs hard deletes: Soft deletes preserve data but require filtering `is_active=True` in queries

### Frontend

For the frontend, I went with a React + Vite + Tailwind configuration.
React is arguably the most used frontend framework. I felt it was perfect for the timeframe given, and I have experience with it.
Vite is a build tool for React. I chose Vite especially because of its extremely fast hot-reload feature (changes are seen instantly after saving a file).
I used Tailwind CSS for styling. It’s helpful for inline styling, is responsive and looks really good.
The combination of these three means that the web application is responsive and compatible for both desktop and mobile users.
On top of the backend validation, there is also client side validation: For eg:

- Password should be 8 characters, contains a number and contains a letter
- The requests sent to the backend are ensured to be complete

## Version Control

Even though I was a solo developer, I used version control to keep track of different features added. Although because of the timeframe I couldn’t leverage version control extensively, I still created new branches for new features and committed backend and frontend tasks together.

## Challenges Faced

The biggest challenge was definitely the timeframe. I had a lot of ideas I wished to implement (which I will write in a later section), but I couldn’t because of the timeframe.

## AI Used

To be completely honest, I used ChatGPT/Claude throughout the journey, as I believe utilizing AI tools is the new meta for software development. But instead of copy and pasting the content, I wrote the outline and my ideas, and these models generated the boilerplate code. I read the output line by line, and there were many errors which I debugged myself. I specifically used ChatGPT for the backend and Claude for the frontend, as Claude is much better at UI/UX and designing frontends. I also validated the output generated bt reading the documentation.

## User Feedback

To get actual user feedback, I asked my dad (non-CS background) to use the application as an actual user. He provided insights such as a confirmation message when canceling a subscription, and some other UX suggestions which I incorporated later.

## Edge Cases Considered

Some of the edge cases I considered are:

- The user entered a negative cost.
- Even if the start date is in the past (more than the billing cycle), the next start date will be accurate.

## Trade-offs Made

1. I had to prioritize some of the backend features over others because of the timeframe. For eg: the savings calculator. I had an idea on how to approach this but the timeframe was nto sufficient.
2. I could not implement unit testing because of the timeframe.
3. I had to use SQLite over PostgreSQL because of the tradeoff regarding hosting the database.
4. The authentication was made simple, instead of adding email verification/2FA/social login.

## What I Learned

The new technologies I learned were:

- Django DRF
- OpenAPI serializer — this was used to validate users’ input from the backend
- Vite — I hadn’t used Vite before
  Other than these technologies, I also learned how to complete a project solo within a short timeframe.

## Future Improvements

Here are some of the ideas I wished to implement:

- User receives a verification email when registering.
- User receives an email 7 days before a renewal date as a reminder, and another email a day before.
- User gives access to their email inbox, and I retrieve users’ subscription information by parsing their inbox for keywords such as “subscription,” “payments,” etc.
- Current charts include a pie chart (for different billing cycles) and a bar chart (for different categories). I wanted to add a line graph for monthly costs over the past months. I still had to do the backend for it as well as the frontend.
- Add different currencies, and auto-convert them to the user’s desired currency.
- Add a notification box on the dashboard which shows subscriptions added, subscriptions deleted, future renewals, etc.
