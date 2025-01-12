
# MyPlayerTracker
by Matthew Ortega

## Overview

Do you like sports? Are you just getting into sports? Or do you want to start following
sports? It can be hard, there is a lot to learn and keep track of. Even for regular fans,
it's hard to constantly keep up with your favorite players especially if you follow several
different sports. 

MyPlayerTracker can help! This website will allow you to make a list of your favorite sports
players and allow you to add all sorts of important information about them! What do they look
like? Any recent news or highlights involving them? Link them!

MyPlayerTracker users can register and login to an account to keep track of all their favorite
players. Once logged in, you can add or remove or favorite players. Each player will have
their own page, where you can add highlights, news, and more!

## Data Model

The application with store Users, Players, News, and Highlights

* Users can have multiple Players via references
* Players can have multiple News, both via embedding

An Example User:

```javascript
{
  username: "matthewthefan",
  hash: // password
  players: // array of references to Player documents
}

```

An Example Player with Embedded News and Highlights:

```javascript
{
  user: // reference to a User object
  name: "Jose Altuve",
  age: 34,
  sport: "baseball",
  bio: "he is altuve",
  news: [
    { title: "Altuve signs new deal", link: "link to website", date: "1/1/2022" }
  ]
}
```

## [Link to Commented First Draft Schema](db.mjs) 

## Wireframes

/tracker - main page

![tracker](documentation/tracker.JPG)

/tracker/add - page for adding players

![tracker add](documentation/tracker-add.JPG)

/tracker/remove - page for removing players

![tracker remove](documentation/tracker-remove.JPG)

/tracker/slug - page for each specific player

![tracker](documentation/tracker-slug.JPG)

## Site map

![site map](documentation/sitemap.JPG)

## User Stories or Use Cases

1. as non-registered user, I can register a new account with the site
2. as a user I can log in to the site
3. as a user I can add a player
4. as a user I can remove a player
5. as a user I can view all of the players I've added in a list
6. as a user I can view a specific player's page
7. as a user I can add news involving a player to their page

## Research Topics

* will adjust points after more research, still deciding

* (4 points) Integrate user authentication
  * User must create an account to login, with a username, password, and enail.
* (5 points) Implement email verification
  * To actually use the account, user must verify their account via email. A code
  * will be sent and the user must input it to verify their account.


10 points total out of 8 required points


## [Link to Initial Main Project File](app.mjs) 


## Annotations / References Used

* no reference code used so far

