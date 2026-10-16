const groups = [
  {
    title: "Languages",
    technologies: [
      ["HTML5", "html5", "#e34f26"],
      ["CSS3", "css3", "#2d7ff9"],
      ["JavaScript", "javascript", "#f7df1e"],
      ["TypeScript", "typescript", "#3178c6"],
      ["Python", "python", "#4b8bbe"],
      ["PowerShell", "powershell", "#5391fe"],
    ],
  },
  {
    title: "Frontend",
    technologies: [
      ["React", "react", "#61dafb"],
      ["Next.js", "nextjs", "#ffffff"],
      ["React Native", "react-native", "#61dafb"],
      ["React Router", "react-router", "#f44250"],
      ["Vite", "vite", "#a855f7"],
      ["Tailwind CSS", "tailwind", "#38bdf8"],
      ["WordPress", "wordpress", "#4f94d4"],
      ["GSAP", "gsap", "#88ce02"],
      ["Three.js", "threejs", "#ffffff"],
    ],
  },
  {
    title: "Backend & Cloud",
    technologies: [
      ["Node.js", "nodejs", "#6cc24a"],
      ["Vercel", "vercel", "#ffffff"],
      ["Netlify", "netlify", "#2dd4bf"],
      ["Firebase", "firebase", "#ffca28"],
      ["Google Cloud", "google-cloud", "#4285f4"],
      ["Resend", "resend", "#ffffff"],
    ],
  },
  {
    title: "Tools & Design",
    technologies: [
      ["Git", "git", "#f05032"],
      ["GitHub", "github", "#ffffff"],
      ["npm", "npm", "#cb3837"],
      ["Figma", "figma", "#f24e1e"],
      ["Canva", "canva", "#00c4cc"],
      ["Adobe XD", "adobe-xd", "#ff61f6"],
      ["Blender", "blender", "#ea7600"],
    ],
  },
];

export default function TechStack() {
  return (
    <section id="stack" className="wrap">
      <h2>Tech I use</h2>
      <div className="grid3" id="techgrid">
        {groups.map(group => (
          <div className="tgroup" key={group.title}>
            <h3>{group.title}</h3>
            <div className="tiles">
              {group.technologies.map(([name, icon, color]) => (
                <div className="tile" key={name} style={{ "--c": color }}>
                  <span className="ic" aria-hidden="true">
                    <img
                      src={`/assets/tech/${icon}.svg`}
                      alt=""
                      width="34"
                      height="34"
                      loading="lazy"
                    />
                  </span>
                  <span className="nm">{name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
