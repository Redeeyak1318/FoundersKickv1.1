$prompt = @"
Design and build a responsive social-style dashboard layout closely matching the requested three-column structure, spacing, and arrangement. 
1. Left Sidebar [Fixed vertical: Profile at top with cover, avatar, name, username, stats, CTA, 4-5 shortcuts]. 
2. Top Header [Horizontal bar: Platform text left, search center, icons/profile right]. 
3. Center Column [Feed Section: Stacked composer card, sorting control right, feed post cards with avatar, name, time, text, media, interaction row, comment input]. 
4. Right Sidebar [Widgets panel: stacked widgets including activity panel with avatars and actions, and suggested users panel with follow buttons]. 
Responsive: collapse right sidebar on tablet, stack layout on mobile. Focus strictly on layout, hierarchy, proportions, and component structure. 
DO NOT decide colors/typography/visual styling here, focus on the grid and layout logic.
"@

superdesign create-design-draft --project-id 366094ef-a3e5-463c-9437-5908a289c5ce --title "Social Dashboard Layout" -p $prompt --context-file src/components/layout/AppLayout.jsx --context-file src/pages/Dashboard.jsx --context-file src/index.css --context-file src/components/ui/GlassCard.jsx --context-file src/components/ui/MagneticButton.jsx --context-file src/data/mockData.js > draft.txt 2>&1
