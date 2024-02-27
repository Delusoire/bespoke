import { S } from "../expose/expose.js";
import { kebabCase } from "../deps.js";

type Task<A> = (() => Awaited<A>) | (() => Promise<Awaited<A>>);

const { React } = S;
const { ButtonSecondary } = S.ReactComponents;

type OmitType<A> = Omit<A, "type">;

export enum FieldType {
	BUTTON = "button",
	TOGGLE = "toggle",
	INPUT = "input",
	HIDDEN = "hidden",
}

export interface BaseField<I extends string> {
	id: I;
	type: FieldType;
	desc: string;
}

export type SettingsField = HiddenField | InputField | ButtonField | ToggleField;

export interface ButtonField<I extends string = any> extends BaseField<I> {
	type: FieldType.BUTTON;
	text: string;
	onClick?: () => void;
}
export interface ToggleField<I extends string = any> extends BaseField<I> {
	type: FieldType.TOGGLE;
	onSelected?: (checked: boolean) => void;
}

export interface InputField<I extends string = any> extends BaseField<I> {
	type: FieldType.INPUT;
	inputType: string;
	onChange?: (value: string) => void;
}

export interface HiddenField<I extends string = any> extends BaseField<I> {
	type: FieldType.HIDDEN;
}

import SettingsSectionRegistry from "../registers/settingsSection.js";

export class SettingsSection<A = Record<string, never>> {
	public id: string;
	public sectionFields: { [key: string]: JSX.Element } = {};

	constructor(public name: string) {
		this.id = kebabCase(name);
	}

	pushSettings = () => {
		SettingsSectionRegistry.register(<this.SettingsSection />, () => true);
	};

	toObject = () =>
		new Proxy(
			{},
			{
				get: (target, prop) => SettingsSection.getFieldValue(this.getId(prop.toString())),
				set: (target, prop, newValue) => {
					const id = this.getId(prop.toString());
					if (SettingsSection.getFieldValue(id) === newValue) return false;
					SettingsSection.setFieldValue(id, newValue);
					return true;
				},
			},
		) as A;

	addButton = <I extends string>(props: OmitType<ButtonField<I>>) => {
		this.addField(FieldType.BUTTON, props, this.ButtonField);
		return this;
	};

	addToggle = <I extends string>(props: OmitType<ToggleField<I>>, defaultValue: Task<boolean> = () => false) => {
		this.addField(FieldType.TOGGLE, props, this.ToggleField, defaultValue);
		return this as SettingsSection<A & { [X in I]: boolean }>;
	};

	addInput = <I extends string>(props: OmitType<InputField<I>>, defaultValue: Task<string> = () => "") => {
		this.addField(FieldType.INPUT, props, this.InputField, defaultValue);
		return this as SettingsSection<A & { [X in I]: string }>;
	};

	private addField<SF extends SettingsField>(type: SF["type"], opts: OmitType<SF>, fieldComponent: React.FC<SF>, defaultValue?: any) {
		if (defaultValue !== undefined) {
			const settingId = this.getId(opts.id);
			SettingsSection.setDefaultFieldValue(settingId, defaultValue);
		}
		const field = Object.assign({}, opts, { type }) as SF;
		this.sectionFields[opts.id] = React.createElement(fieldComponent, field);
	}

	getId = (nameId: string) => ["settings", this.id, nameId].join(":");

	private useStateFor = <A,>(id: string) => {
		const [value, setValueState] = React.useState(SettingsSection.getFieldValue<A>(id));

		return [
			value,
			(newValue: A) => {
				if (newValue !== undefined) {
					setValueState(newValue);
					SettingsSection.setFieldValue(id, newValue);
				}
			},
		] as const;
	};

	static getFieldValue = <R,>(id: string): R => JSON.parse(localStorage[id] ?? "null");

	static setFieldValue = (id: string, newValue: any) => {
		localStorage[id] = JSON.stringify(newValue ?? null);
	};

	private static setDefaultFieldValue = async (id: string, defaultValue: Task<any>) => {
		if (SettingsSection.getFieldValue(id) === null) SettingsSection.setFieldValue(id, await defaultValue());
	};

	private SettingsSection = () => (
		<S.SettingsSection filterMatchQuery={this.name}>
			<S.SettingsSectionTitle>{this.name}</S.SettingsSectionTitle>
			{Object.values(this.sectionFields)}
		</S.SettingsSection>
	);

	SettingField = ({ field, children }: { field: SettingsField; children?: any }) => (
		<S.ReactComponents.SettingColumn filterMatchQuery={field.id}>
			<div className="x-settings-firstColumn">
				<S.ReactComponents.SettingText htmlFor={field.id}>{field.desc}</S.ReactComponents.SettingText>
			</div>
			<div className="x-settings-secondColumn">{children}</div>
		</S.ReactComponents.SettingColumn>
	);

	ButtonField = (field: ButtonField) => (
		<this.SettingField field={field}>
			<ButtonSecondary id={field.id} buttonSize="sm" onClick={field.onClick} className="x-settings-button">
				{field.text}
			</ButtonSecondary>
		</this.SettingField>
	);

	ToggleField = (field: ToggleField) => {
		const id = this.getId(field.id);
		const [value, setValue] = this.useStateFor<boolean>(id);
		return (
			<this.SettingField field={field}>
				<S.ReactComponents.SettingToggle
					id={field.id}
					value={SettingsSection.getFieldValue(id)}
					onSelected={(checked: boolean) => {
						setValue(checked);
						field.onSelected?.(checked);
					}}
					className="x-settings-button"
				/>
			</this.SettingField>
		);
	};

	InputField = (field: InputField) => {
		const id = this.getId(field.id);
		const [value, setValue] = this.useStateFor<string>(id);
		return (
			<this.SettingField field={field}>
				<input
					className="x-settings-input"
					id={field.id}
					dir="ltr"
					value={SettingsSection.getFieldValue(id)}
					type={field.inputType}
					onChange={e => {
						const value = e.currentTarget.value;
						setValue(value);
						field.onChange?.(value);
					}}
				/>
			</this.SettingField>
		);
	};
}
