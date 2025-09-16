# Decisions

## Product Thinking

My first approach was to think about the problem from a user point of view. If I were the user, what would I actually need? I used my own subscriptions as inspiration and added two features that felt essential but weren’t explicitly in the instructions: free trials and custom billing cycles (e.g., every 3 months or every 14 days).

## Architecture Decisions

### Backend

I used Django + Django REST Framework, as recommended in the instructions. I’ve used Django once before, and while there was a small learning curve, my Python/Flask background helped. I chose a monolithic architecture because Django provides batteries-included features (ORM, admin, auth), which reduce external dependencies and are ideal for a solo developer. It’s also production-ready at a small scale.
The following is how my backend is structured:
![alt text](image.png)

### Database

For the database, I went with the default SQLite. I considered PostgreSQL (better for production), but chose SQLite to simplify reviewer setup, as they might not have PostgreSQL installed.
As for why I did not choose a NoSQL database, I felt like this application was more suited for a tabular format rather than a document format.

### Frontend

For the frontend, I went with a React + Vite + Tailwind configuration.
React is arguably the most used frontend framework. I felt it was perfect for the timeframe given, and I have used it before.
Vite is a build tool for React. I chose Vite especially because of its extremely fast hot-reload feature (changes are seen instantly after saving a file).
I used Tailwind CSS for styling. It’s helpful for inline styling and looks really good.

## Version Control

Even though I was a solo developer, I used version control to keep track of different features added. Although because of the timeframe I couldn’t leverage version control extensively, I still created new branches for new features and committed backend and frontend tasks together.

## Challenges Faced

The biggest challenge was definitely the timeframe. I had a lot of ideas I wished to implement (which I will write in a later section), but I couldn’t because of the timeframe.

## AI Used

To be completely honest, I used ChatGPT/Claude throughout the journey, as I believe utilizing AI tools is the new meta for software development. But I did not copy and paste the content. Instead, I wrote the outline and my ideas, and these models generated the boilerplate code. I read the output line by line, and there were many errors which I debugged myself. I specifically used ChatGPT for the backend and Claude for the frontend, as Claude is much better at UI/UX and designing frontends.

## Future Improvements

Here are some of the ideas I wished to implement:

* User receives a verification email when registering.
* User receives an email 7 days before a renewal date as a reminder, and another email a day before.
* User gives access to their email inbox, and we retrieve users’ subscription information by parsing their inbox for keywords such as “subscription,” “payments,” etc.
* Current charts include a pie chart (for different billing cycles) and a bar chart (for different categories). I wanted to add a line graph for monthly costs over the past months. I still had to do the backend for it as well as the frontend.
* Add different currencies, and auto-convert them to the user’s desired currency.
* Add a notification box on the dashboard which shows subscriptions added, subscriptions deleted, future renewals, etc.

## User Feedback

To get actual user feedback, I asked my dad (non-CS background) to use the application as an actual user. He provided insights such as a confirmation message when canceling a subscription, and some other UX suggestions which I incorporated later.

## Edge Cases Considered

* The user entered a negative cost.
* Even if the start date is in the past (more than the billing cycle), the next start date will be accurate.

## Trade-offs Made

1. I had to prioritize some of the backend features over others because of the timeframe.

## What I Learned

The new technologies I learned were:

* Django DRF
* OpenAPI serializer — this was used to validate users’ input from the backend
* Vite — I hadn’t used Vite before
