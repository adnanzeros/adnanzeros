import './blog-bg.css';

/* /blog ar /blog/[slug] duto page e same bokeh background */
export default function BlogLayout({ children }) {
  return <div className="blog-bg">{children}</div>;
}
