import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const PageTitle = ({ title }) => {
  const baseTitle = 'MTLS';
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
    </Helmet>
  );
};

PageTitle.propTypes = {
  title: PropTypes.string
};

export default PageTitle; 