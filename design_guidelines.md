# Dark Timer Challenge - Design Guidelines

## Design Approach
**Reference-Based**: Minimalist arcade/game aesthetic with high contrast dark UI, inspired by retro digital timers and competitive gaming leaderboards.

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background: Pure black (#000000)
- Timer Display: Bright red (0 100% 50%)
- Top-1 Banner: Gold/yellow (45 100% 50%)
- Rank Display: Bright green (120 100% 40%)
- Start Button: White background with black text
- Red Stop Button: Bright red (0 100% 50%)

### B. Typography

**Font Families**
- Primary: System monospace font for timer (monospace, 'Courier New')
- Secondary: Sans-serif for UI text (system-ui, -apple-system, sans-serif)

**Font Sizes & Weights**
- Timer: Very large (text-6xl to text-8xl), bold (font-bold)
- Top-1 Banner: Medium-large (text-2xl), semi-bold (font-semibold)
- Rank Display: Medium (text-xl), medium weight (font-medium)
- Buttons: Medium (text-lg), medium weight
- Name Input: Large (text-lg)

### C. Layout System

**Spacing Units**: Tailwind units of 4, 8, 12, 16, 24 (p-4, h-8, m-12, space-y-16, etc.)

**Structure**
- Full viewport height (min-h-screen)
- Centered flex container for all content
- Vertical stacking with consistent spacing (space-y-8 to space-y-16)

### D. Component Library

**1. Name Input Screen**
- Full-screen black background
- Centered card/container
- Large input field for name (white border, transparent background, white text)
- Submit button (white background, black text, rounded)

**2. Top-1 Banner**
- Fixed position at top of game UI
- Gold text displaying: "{Name} did it in {X} attempts — '{feedback message}'"
- Full width, centered text
- Padding: py-4 to py-6

**3. Timer Display**
- Center of viewport
- Red monospace font
- Format: XX.XX (showing seconds.centiseconds)
- Size: Very large (100-120px font size equivalent)

**4. Start Button**
- White background, black text
- Rounded corners (rounded-lg)
- Positioned below timer
- Visible initially, disappears when clicked

**5. Red Stop Button**
- Circular shape (aspect-square, rounded-full)
- Solid red background
- No text/label
- Large size (w-24 h-24 to w-32 h-32)
- Appears after Start clicked, replaces Start button
- Centered below timer

**6. Rank Display**
- Below timer/buttons
- Green text
- Format: "Current Rank: #{number}" or "Perfect 10! Rank: #{number}"
- Prominent display after attempt

**7. Attempt Counter** (Optional Addition)
- Below rank or in corner
- White/gray text
- Format: "Attempts: {X}"

### E. Interactions & States

**Timer Behavior**
- Starts at 00.00
- Updates every 0.01 seconds (10ms intervals)
- Red color throughout
- Freezes when stop button clicked

**Button States**
- Start Button: White bg → disappears on click
- Red Stop Button: Solid red → appears after Start → clickable once
- Hover states: Slight opacity change (hover:opacity-90)

**Screen Transitions**
- Name input → Main game: Instant swap (hide name screen, show game UI)
- Start click → Red button appears: Instant swap with button replacement

### F. Page Flow

**Initial State (Name Input)**
```
[Black Background]
  [Centered Container]
    - App Title (white text, large)
    - Name Input Field
    - Submit Button
```

**Game UI State**
```
[Black Background]
  [Top-1 Banner - Gold Text]
  
  [Center Area]
    - Timer (Red, XX.XX)
    - Start Button OR Red Stop Button
    - Rank Display (Green, after attempt)
    - Attempts Counter
```

## Images
No images required - pure UI/text-based game interface.

## Critical Design Notes

1. **High Contrast**: Black background with vibrant red, gold, and green creates arcade-like visibility
2. **Minimalist**: No decorative elements, focus purely on functional game elements
3. **Button Behavior**: Start button and Red button are mutually exclusive - never show both simultaneously
4. **Timer Precision**: Must display centiseconds (XX.XX format) for the 10.00s challenge
5. **Rank Visibility**: Make rank display prominent with green color after each attempt
6. **Top-1 Persistence**: Gold banner always visible during gameplay showing current leader

## Responsive Behavior
- Mobile: Stack all elements vertically, reduce timer size slightly (text-5xl to text-6xl)
- Desktop: Same layout, larger timer (text-8xl)
- All breakpoints: Maintain centered alignment and full viewport height