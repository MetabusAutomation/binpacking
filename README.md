# Rectangle Packing Tool

A web-based tool for efficiently planning sheet layouts. This application helps you organize rectangular pieces on standard-sized sheets with automatic packing optimization. It allows for the additional constraint of maximum section length, often useful for pracatical applications.

## Live Application

You can try it for yourself at the github pages link to the right.

## Features

- **Efficient Rectangle Packing**: Uses a skyline algorithm heuristic to place rectangles with less wasted space
- **Section-Based Layouts**: Automatically divides layouts into sections that fit within your maximum length
- **VerticalOrientation**: Places rectangles with their longer dimension vertical for concavity accomodation
- **Measurement Parser**: Quickly add multiple pieces by pasting measurements in a simple format
- **Print Functionality**: Generate printable layouts with a single click

## How It Works

1. Enter the canvas width and maximum section length
2. Add sheets individually or paste multiple measurements in bulk
3. Click "Place All Sheets on Canvas" to generate the optimized layout
4. Print the layout or continue making adjustments
