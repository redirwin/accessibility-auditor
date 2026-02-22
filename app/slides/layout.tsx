import "./slides.css";

export const metadata = {
  title: "AI Coding Agents: From Chaos to Control",
  description:
    "A clean HTML/CSS slide deck with simple navigation and transitions. Demo only.",
};

export default function SlidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
