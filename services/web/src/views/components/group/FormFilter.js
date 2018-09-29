import React, { PureComponent, Fragment } from 'react';
import propTypes from 'prop-types';
import { Col, InputGroup, Input, CustomInput } from 'reactstrap';

class FormFilter extends PureComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			search   : this.props.search,
			_search  : this.props.search,
			isTarget : this.props.isTarget,
			_isTarget: this.props.isTarget,
		};
		
		this.inputId = Math.random();
	}
	
	static getDerivedStateFromProps(props, state) {
		const newState = {};
		if (props.search !== state._search) {
			newState.search  = props.search;
			newState._search = props.search;
		}
		
		if (props.isTarget !== state._isTarget) {
			newState.isTarget  = props.isTarget;
			newState._isTarget = props.isTarget;
		}
		
		if (!Object.keys(newState).length) {
			return null;
		}
		console.log(props, state, newState);
		
		return newState;
	}
	
	static propTypes = {
		change  : propTypes.func,
		search  : propTypes.string,
		isTarget: propTypes.bool,
	};
	
	formChange = () => {
		const { isTarget, search } = this.state;
		this.props.change({ isTarget, search });
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
						<CustomInput
							id={this.inputId}
							onChange={this.onFilterChange}
							type='checkbox'
							label='Только для лайков'
							checked={this.state.isTarget}
						/>
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<div className="input-group-prepend">
							<span className="input-group-text"><i className='fa fa-search'/></span>
						</div>
						<Input value={this.state.search} onChange={this.onSearchChange} type='text' placeholder='...'/>
					</InputGroup>
				</Col>
			</Fragment>
		);
	}
}

export default FormFilter;
