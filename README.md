<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# The Living Playbook: Gemini as a Sales Teacher

> **Gemini 3.0 Hackathon Submission - Statement Three**

## 💡 Project Description

**We focused entirely on Statement Three: Gemini as a Teacher.**

In high-stakes sales, "getting an answer" isn't enough; reps need to learn *how* to win. We built a system where **Gemini acts as an active Sales Teacher** that helps humans rapidly level up.

Instead of static PDFs, our system ingests real-world failure cases (audio/video calls) and autonomously creates **derivatives** (new playbook rules) and **feedback loops** (retrospective coaching). It transforms unstructured conversation data into a structured **curriculum**, ensuring that a junior rep learns the deep "domain context" instantly. We turned Gemini into a mentor that reasons through mistakes and updates the lesson plan in real-time.

## ⚙️ How We Used Gemini 3.0

We utilized **Gemini 3.0 Pro** via AI Studio to create a "Teacher Architecture":

1.  **Multimodal Feedback Loops:** We fed raw audio/video to analyze non-verbal cues, creating a rich evaluation environment that text alone cannot provide.
2.  **Reasoning for Curricula:** We leveraged Gemini's reasoning capabilities to extract "Winning Patterns" from long-context history and convert them into teachable moments (The Living Playbook).
3.  **Dynamic Evals:** The model acts as a coach, grading the human's performance against the generated playbook and offering specific corrective actions.
4.  **Schema-Driven Analysis:** We defined a deep **Sales DNA schema** using Pydantic—modeling everything from 'Personality Traits' to 'Micro-Temperature Shifts'. Gemini maps unstructured audio against this complex schema instantly to profile leads (e.g., "Skeptical", "ROI-Driven").

## 🎥 Demo Strategy

Our demo showcases how Gemini identifies a deal-breaking moment (e.g., timestamp 42s) where a 'Feature-Oriented' pitch clashed with an 'ROI-Driven' buyer, diagnosing the 'Strategy Clash' with a forensic level of detail.

## 🚀 Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3.  Run the app:
    ```bash
    npm run dev
    ```
