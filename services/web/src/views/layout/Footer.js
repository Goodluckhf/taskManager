import React, { PureComponent } from 'react';
import PropTypes                from 'prop-types';

const propTypes = {
	children: PropTypes.node,
};

const defaultProps = {};

class Footer extends PureComponent {
	render() {
	// eslint-disable-next-line
    const { children, ...attributes } = this.props;
		return (
			<React.Fragment>
				<span><a href="https://coreui.io">CoreUI</a> &copy; 2018 creativeLabs.</span>
				<span className="ml-auto">Powered by <a href="Goodluckhf@yandex.ru">Хлопчики девелопчики</a></span>
			</React.Fragment>
		);
	}
}

Footer.propTypes    = propTypes;
Footer.defaultProps = defaultProps;

export default Footer;
