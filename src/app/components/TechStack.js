import styles from "./TechStack.module.css";

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

const orbitIcons = [
  ["html5", 98, 44],
  ["typescript", 252, 54],
  ["react", 322, 144],
  ["css3", 274, 244],
  ["javascript", 86, 232],
  ["github", 40, 140],
];

export default function TechStack() {
  return (
    <section id="stack" className="wrap">
      <h2>Tech I use</h2>
      <div className={styles.panel}>
        <p className={styles.kicker}>// TECH STACK</p>
        <h3 className={styles.panelTitle}>Tools I build with</h3>
        <div className={styles.content}>
          <div className={styles.orbit}>
            <svg
              className={styles.illustration}
              viewBox="0 0 400 320"
              role="img"
              aria-label="Technology icons orbiting a code symbol"
            >
              <defs>
                <radialGradient id="tech-stack-core">
                  <stop offset="0%" stopColor="#FF2D95" stopOpacity=".9" />
                  <stop offset="55%" stopColor="#007BA7" stopOpacity=".85" />
                  <stop offset="100%" stopColor="#007BA7" stopOpacity=".15" />
                </radialGradient>
                <radialGradient id="tech-stack-halo">
                  <stop offset="0%" stopColor="#FF2D95" stopOpacity=".2" />
                  <stop offset="100%" stopColor="#007BA7" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="200" cy="160" r="112" fill="url(#tech-stack-halo)" />
              <g
                className={styles.orbitPaths}
                fill="none"
                stroke="#007BA7"
                strokeOpacity=".48"
                strokeWidth="1"
              >
                <ellipse cx="200" cy="160" rx="148" ry="94" />
                <ellipse
                  cx="200"
                  cy="160"
                  rx="148"
                  ry="94"
                  transform="rotate(60 200 160)"
                />
                <ellipse
                  cx="200"
                  cy="160"
                  rx="148"
                  ry="94"
                  transform="rotate(120 200 160)"
                />
              </g>
              <g className={styles.iconNodes}>
                {orbitIcons.map(([icon, x, y]) => (
                  <g key={icon}>
                    <circle
                      cx={x + 14}
                      cy={y + 14}
                      r="18"
                      fill="#0A0A0A"
                      fillOpacity=".9"
                      stroke="#007BA7"
                      strokeOpacity=".55"
                    />
                    <image
                      href={`/assets/tech/${icon}.svg`}
                      x={x + 4}
                      y={y + 4}
                      width="20"
                      height="20"
                    />
                  </g>
                ))}
              </g>
              <circle
                cx="200"
                cy="160"
                r="52"
                fill="url(#tech-stack-core)"
                stroke="#FF2D95"
                strokeOpacity=".65"
              />
              <circle
                cx="200"
                cy="160"
                r="43"
                fill="none"
                stroke="#fff"
                strokeOpacity=".18"
              />
              <text
                x="200"
                y="169"
                textAnchor="middle"
                fill="#fff"
                fontFamily="ui-monospace, monospace"
                fontSize="22"
                fontWeight="700"
              >
                {"</>"}
              </text>
            </svg>
          </div>
          <div className={styles.groups}>
            {groups.map(group => (
              <div className={styles.group} key={group.title}>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <div className={styles.chips}>
                  {group.technologies.map(([name, icon]) => (
                    <span className={styles.chip} key={name}>
                      <img
                        src={`/assets/tech/${icon}.svg`}
                        alt=""
                        width="20"
                        height="20"
                        loading="lazy"
                      />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
