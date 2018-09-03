import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import {
	Card, CardHeader, CardBody,
	Form as BootstrapForm, FormGroup,
	Label, Input, CardFooter,
} from 'reactstrap';

import LoadingButton, { S }  from '../ui/LoadingButton';
import ApiError              from '../ui/ApiError';

class Form extends PureComponent {
	static propTypes = {
		error  : propTypes.object,
		loading: propTypes.bool,
	};
	
	render() {
		return (
			<Card>
				<CardHeader><b>Добавить задачу на автолайкинг</b></CardHeader>
				<CardBody>
					<BootstrapForm>
						<FormGroup>
							<Label>Ссылка на паблик где должен выйти пост</Label>
							<Input onChange={this.handleInput} type='text' placeholder='https://vk.com/nice.advice'/>
							{this.props.error ? <ApiError style={{ marginTop: '24px' }} error={this.props.error}/> : ''}
						</FormGroup>
					</BootstrapForm>
				</CardBody>
				<CardFooter>
					<LoadingButton
						data-size={S}
						data-color='green'
						loading={this.props.loading}
						onClick={this.onClick}
					>
						Добавить
					</LoadingButton>
				</CardFooter>
			</Card>
		);
	}
}

export default Form;
