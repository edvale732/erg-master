# Erg Master

A rowing tracker application built for rowers, by rowers.

[![CI](https://github.com/edvale732/erg-master/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/edvale732/erg-master/actions/workflows/ci.yml)

# [Website Link](https://erg-master.vercel.app/)

# Overview

Erg Master is a full stack rowing tracker web application designed to help rowers keep track of their rowing, strength training and flexibility performance, all in one place. Users can record sessions in the app and visualise their progress. A Python-based machine learning model is used to predict future performance. Erg Master can therefore provide rowers with one single place to track all of their progress, rather than having to use separate apps.


# Implemented Features

- User sign-in, sign-up and authentication using BetterAuth
- Log rowing and strength training sessions
- View session history, edit and delete.
- Logging weight 
- Visualise performance over time with graphs
- 2k performance predictions using xgboost model
- Templates for strength training sessions


# Stack

Frontend
- Next.js
- React
- TypeScript
- TailwindCSS

Database
- Neon Serverless Postgres

Backend
- Python
- FastAPI

Development
- Git
- GitHub
- GitHub Actions

Hosting
- Vercel (Frontend)
- Render (Backend)
- Docker


# Planned Features

- Flexibility tracking
- Improved 2k predictions using rowing dataset, not just individual results
- Allow predictions for more distances
- Mobile app
- Import workouts from Concept2




