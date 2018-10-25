import React, { PureComponent }                from 'react';
import propTypes                                         from 'prop-types';
import {
	Card, CardHeader, CardBody,
	Form as BootstrapForm, FormGroup,
	CardFooter,
}                           from 'reactstrap';
import Textarea from 'react-textarea-autosize';

import LoadingButton, { S } from '../ui/LoadingButton';
import ApiError             from '../ui/ApiError';

class ExternalLinksForm extends PureComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			externalLinks : this.props.externalLinks,
			_externalLinks: this.props.externalLinks,
		};
	}
	
	static getDerivedStateFromProps(props, state) {
		const newState = {};
		if (!props.externalLinks) {
			return null;
		}
		
		const linksArray = props.externalLinks.join('\n');
		if (linksArray !== state._externalLinks) {
			newState.externalLinks  = linksArray;
			newState._externalLinks = linksArray;
		}
		
		if (!Object.keys(newState).length) {
			return null;
		}
		
		return newState;
	}
	
	static propTypes = {
		save         : propTypes.func,
		externalLinks: propTypes.arrayOf(propTypes.string),
		error        : propTypes.object,
		loading      : propTypes.bool,
	};
	
	onSave = () => {
		const { externalLinks } = this.state;
		const links = externalLinks.split('\n').map(link => link.trim());
		
		this.props.save(links);
	};
	
	onLinksChange = (e) => {
		this.setState({ externalLinks: e.target.value });
	};
	
	render() {
		const links = this.state.externalLinks.replace('\\n', '\n');
		return (
			<Card>
				<CardHeader><b>Внешние ссылки для автонакрутки</b></CardHeader>
				<CardBody>
					<BootstrapForm>
						<b>Разделяйте переносом строки</b><br/>
						Не привязываются к задачи, поэтому их можно редактировать в процессе<br/>
						Задача на момент выполнения будет сравнивать из текущего списка<br/>
						<FormGroup>
							<Textarea
								style={{ width: '100%' }}
								onChange={this.onLinksChange}
								value={links}
								placeholder='http://googl.com&#10;http://yandex.ru'
							/>
							{this.props.error ? <ApiError style={{ marginTop: '24px' }} error={this.props.error}/> : ''}
						</FormGroup>
					</BootstrapForm>
				</CardBody>
				<CardFooter>
					<LoadingButton
						data-size={S}
						data-color='green'
						loading={this.props.loading}
						onClick={this.onSave}
					>
						Сохранить
					</LoadingButton>
				</CardFooter>
			</Card>
		);
	}
}

export default ExternalLinksForm;
