# Erg Master

A rowing tracker application built for rowers.

[![CI](https://github.com/edvale732/erg-master/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/edvale732/erg-master/actions/workflows/ci.yml)

# Overview

Erg Master is a full stack rowing tracker web application designed to help rowers keep track of their rowing, strength training and flexibility performance, all in one place. Users can record sessions in the app and visualise their progress. A Python-based machine learning model is used to predict future performance. Erg Master can therefore provide rowers with one single place to track all of their progress, rather than having to use separate apps.

# Planned Features

- User authentication using BetterAuth
- Record sessions
- Visualise performance over time
- Compare actual performance vs targets
- ML performance predictions


# Dev Commands

Run Python backend: 
    `.\.venv\Scripts\Activate.ps1`
    `python -m uvicorn backend.app.main:app --reload`
Run frontend: `pnpm dev`





