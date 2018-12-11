import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
	children: PropTypes.node,
};

const defaultProps = {};

class Footer extends PureComponent {
	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<span className="ml-auto">
				Разработано: <a href="mailto:Goodluckhf@yandex.ru">Goodluckhf@yandex.ru</a>
			</span>
		);
	}
}

Footer.propTypes = propTypes;
Footer.defaultProps = defaultProps;

export default Footer;
