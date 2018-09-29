import React, { PureComponent, Fragment } from 'react';
import propTypes from 'prop-types';
import { Col, CustomInput } from 'reactstrap';

class FormFilter extends PureComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			filter: 'all',
		};
		
		this.filterAllId      = Math.random();
		this.filterActiveId   = Math.random();
		this.filterInactiveId = Math.random();
	}
	
	static propTypes = {
		change: propTypes.func.isRequired,
	};
	
	onFilterChange = (e) => {
		this.setState({ filter: e.target.value }, () => {
			this.props.change(this.state);
		});
	};
	
	render() {
		return (
			<Fragment>
				<Col xs='2'>
					<CustomInput
						id={this.filterAllId}
						onChange={this.onFilterChange}
						type='radio'
						label='Все'
						value='all'
						checked={this.state.filter === 'all'}
						name='autolikes_form_filter'
					/>
				</Col>
				<Col xs='2'>
					<CustomInput
						id={this.filterActiveId}
						onChange={this.onFilterChange}
						type='radio'
						label='Активные'
						value='active'
						checked={this.state.filter === 'active'}
						name='autolikes_form_filter'
					/>
				</Col>
				<Col xs='2'>
					<CustomInput
						id={this.filterInactiveId}
						onChange={this.onFilterChange}
						type='radio'
						label='Не активные'
						value='inactive'
						checked={this.state.filter === 'inactive'}
						name='autolikes_form_filter'
					/>
				</Col>
			</Fragment>
		);
	}
}

export default FormFilter;
