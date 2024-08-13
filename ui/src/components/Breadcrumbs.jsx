import { Link, useLocation } from 'react-router-dom';

const BreadCrumb = () => {
  const location = useLocation();
  console.log(location.pathname);
  const pathnames = location.pathname
    .split('/')
    .filter((x) => x && x.toLowerCase() !== 'home');

  if (pathnames.length === 0) {
    return null;
  }

  const formatBreadcrumb = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/-/g, ' ') // Replace dashes with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
  };

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          return (
            <li key={to} className="breadcrumb-item">
              <Link to={to} aria-disabled="true">
                {formatBreadcrumb(value)}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadCrumb;
