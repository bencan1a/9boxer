# Tone Revision Quick Reference

**Quick guide for applying tone transformations to feature pages**

---

## Voice & Tone Checklist

### ✅ DO: Active, Engaging Voice

- ✅ Use "you" and "your" (second person)
- ✅ Use contractions ("you'll", "don't", "we'll")
- ✅ Use active voice ("Click Upload" not "Upload should be clicked")
- ✅ Keep paragraphs short (2-3 sentences max)
- ✅ Use simple words ("use" not "utilize", "help" not "facilitate")
- ✅ Be encouraging ("Great!", "Perfect!", "Done!")
- ✅ Add personality and warmth

### ❌ DON'T: Passive, Technical Voice

- ❌ Third person ("the user", "one can")
- ❌ Passive voice ("should be clicked", "can be seen")
- ❌ Jargon without explanation
- ❌ Long, dense paragraphs (>3 sentences)
- ❌ Filler words ("basically", "actually", "essentially")
- ❌ Condescending phrases ("simply", "just", "obviously")
- ❌ Walls of text

---

## Common Transformations

### Opening Lines

❌ **BEFORE:** "This page covers the interactive features for managing employees."
✅ **AFTER:** "Here's everything you need to know about working with employees."

❌ **BEFORE:** "The application provides filtering capabilities."
✅ **AFTER:** "Filters help you focus on specific groups."

### Instructions

❌ **BEFORE:** "The filter drawer can be opened by clicking the Filters button."
✅ **AFTER:** "Click the Filters button to open the filter drawer."

❌ **BEFORE:** "Employees are displayed based on the selected criteria."
✅ **AFTER:** "You'll see only employees matching your criteria."

### Technical Descriptions

❌ **BEFORE:** "The system utilizes statistical analysis to identify anomalies."
✅ **AFTER:** "Intelligence runs statistical analysis behind the scenes to spot anomalies."

❌ **BEFORE:** "Data persistence is maintained throughout the session."
✅ **AFTER:** "Your data sticks around while the app is open."

### Benefits/Outcomes

❌ **BEFORE:** "This functionality enables users to focus on specific segments."
✅ **AFTER:** "This helps you zero in on exactly who you need to see."

❌ **BEFORE:** "The feature facilitates efficient workflow management."
✅ **AFTER:** "This makes your work faster and easier."

---

## Required Additions

### "Success Looks Like" Section

**When to add:** After explaining how to do something major

**Format:**
```markdown
### ✅ Success! You've [Completed Action]

You'll see:
- [Specific visual indicator 1]
- [Specific visual indicator 2]
- [Specific outcome 1]
- [Specific outcome 2]
```

**Example:**
```markdown
### ✅ Success! You've Applied Filters

You'll see:
- The grid showing only employees matching your criteria
- An orange dot on the Filters button
- The employee count updated (e.g., "12 of 47 employees")
- A focused view perfect for your current task
```

### "Why This Matters" Box

**When to add:** After explaining a feature, to provide context

**Format:**
```markdown
> 💡 **Why This Matters**
>
> [1-2 sentences explaining real-world benefit and context]
```

**Example:**
```markdown
> 💡 **Why This Matters**
>
> Filters help you focus during calibration meetings. Instead of scrolling through 200 employees, you can quickly view just your team, a specific department, or high-performers who need development plans.
```

---

## Word Replacements

### Replace Technical → Plain Language

| Replace This | With This |
|--------------|-----------|
| "utilize" | "use" |
| "facilitate" | "help" |
| "enable" | "let you" |
| "comprehensive" | "complete" or "full" |
| "functionality" | "feature" |
| "capability" | "ability" or just describe what it does |
| "interface" | "screen" or specific element name |
| "navigate to" | "go to" |
| "select" | "choose" or "click" |
| "indicates" | "shows" or "means" |

### Replace Passive → Active

| Passive Voice | Active Voice |
|---------------|--------------|
| "can be clicked" | "you can click" or "click" |
| "is displayed" | "appears" or "you'll see" |
| "are shown" | "you'll see" |
| "should be used" | "use" |
| "will be saved" | "we'll save" or "gets saved" |
| "can be applied" | "you can apply" |

### Replace Formal → Conversational

| Formal | Conversational |
|--------|----------------|
| "in order to" | "to" |
| "at this point in time" | "now" |
| "in the event that" | "if" |
| "prior to" | "before" |
| "subsequent to" | "after" |
| "additionally" | "also" |
| "however" | "but" |
| "therefore" | "so" |

---

## Paragraph Structure

### ❌ TOO LONG (5+ sentences)

```markdown
The Statistics tab displays a comprehensive overview of how your employees
are distributed across the 9-box grid. A table showing the breakdown of
employees by performance and potential is provided. Each cell shows the
count and percentage of employees in that box. This makes it easy to spot
imbalances and patterns at a glance. The visual bar chart representation of
your data helps you quickly assess distribution health.
```

### ✅ PERFECT (2-3 sentences, scannable)

```markdown
The Statistics tab shows you exactly how your people are spread across the
grid. You'll see a table breaking down counts and percentages for each box.

The visual bar chart makes patterns easy to spot at a glance.
```

---

## Tone Examples by Page

### filters.md (Conversational, Helpful)

✅ "Need to focus on just your Sales team? Filters help you zero in on specific groups."
✅ "Click outside the drawer or press Filters again to close."
✅ "Done! Now you're looking at just your engineers."

### statistics.md (Clear, Data-Focused)

✅ "The Statistics tab shows you exactly how your people are spread across the grid."
✅ "Intelligence runs statistical analysis behind the scenes."
✅ "We highlight outliers with color coding."

### tracking-changes.md (Organized, Reliable)

✅ "The change tracker shows you everyone you've moved in a clean table."
✅ "We track everything automatically."
✅ "The tracker cleans up after itself."

### donut-mode.md (Challenging, Insightful)

✅ "Do these people REALLY belong in the center box?"
✅ "We track donut placements separately - they won't mess up your real ratings."
✅ "Donut Mode forces you to challenge those placements."

### working-with-employees.md (Direct, Practical)

✅ "Click any employee tile and the right panel opens with four tabs full of details."
✅ "Moving employees is drag-and-drop simple."
✅ "The Details tab gives you the full picture."

### exporting.md (Urgent, Important)

✅ "Export saves your work to Excel. This is THE critical step!"
✅ "There's no auto-save, so export early and often!"
✅ "Your original stays untouched."

### settings.md (Simple, Straightforward)

✅ "Settings is where you customize 9Boxer to match your preferences."
✅ "We save your theme choice automatically."
✅ "You've got three theme choices."

### understanding-grid.md (Educational, Strategic)

✅ "Think of the 9-box grid as a 3×3 tic-tac-toe board."
✅ "Each box tells you something different about an employee."
✅ "Stars (top-right) are your future leaders - invest heavily."

---

## Quality Check

Before finishing a page, verify:

- [ ] All "you/your" (no third person)
- [ ] Active voice throughout (no passive constructions)
- [ ] Paragraphs 2-3 sentences max
- [ ] "Success Looks Like" sections added
- [ ] "Why This Matters" boxes added
- [ ] Simple, conversational language
- [ ] Technical accuracy preserved
- [ ] Links still work
- [ ] Examples are relatable

---

## Pro Tips

1. **Read it aloud** - If it sounds stiff or formal, rewrite it
2. **Imagine explaining to a friend** - Use that casual tone
3. **Cut ruthlessly** - Remove unnecessary words
4. **Show, don't tell** - Use examples and scenarios
5. **End with action** - Tell readers what to do next

---

**Remember:** We're making documentation friendly and accessible, not dumbing it down. The goal is clarity and engagement while maintaining accuracy.
