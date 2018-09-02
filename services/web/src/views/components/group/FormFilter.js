import React, { PureComponent, Fragment } from 'react';
import propTypes from 'prop-types';
import { Col, InputGroup, Input, CustomInput } from 'reactstrap';

class FormFilter extends PureComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			search  : '',
			isTarget: false,
		};
	}
	
	static propTypes = {
		change: propTypes.func,
	};
	
	formChange = () => {
		this.props.change(this.state);
	};
	
	onSearchChange = (e) => {
		this.setState({ search: e.target.value.trim() }, () => {
			this.formChange();
		});
	};
	
	onFilterChange = (e) => {
		this.setState({ isTarget: e.target.checked }, () => {
			this.formChange();
		});
	};
	
	render() {
		return (
			<Fragment>
				<Col>
					<InputGroup>
						<CustomInput id={Math.random()} onChange={this.onFilterChange} type='checkbox' label='Только для лайков'/>
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<div className="input-group-prepend">
							<span className="input-group-text"><i className='fa fa-search'/></span>
						</div>
						<Input onChange={this.onSearchChange} type='text' placeholder='...'/>
					</InputGroup>
				</Col>
			</Fragment>
		);
	}
}

export default FormFilter;
