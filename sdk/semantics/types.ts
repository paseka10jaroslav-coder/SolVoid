
export interface Idl {
    version: string;
    name: string;
    instructions: IdlInstruction[];
    accounts?: IdlAccount[];
    types?: IdlType[];
    events?: IdlEvent[];
    errors?: IdlError[];
}

export interface IdlInstruction {
    name: string;
    accounts: IdlAccountItem[];
    args: IdlField[];
}

export interface IdlAccountItem {
    name: string;
    isMut: boolean;
    isSigner: boolean;
}

export interface IdlField {
    name: string;
    type: any;
}

export interface IdlAccount {
    name: string;
    type: {
        kind: 'struct';
        fields: IdlField[];
    };
}

export interface IdlType {
    name: string;
    type: any;
}

export interface IdlEvent {
    name: string;
    fields: IdlField[];
}

export interface IdlError {
    code: number;
    name: string;
    msg: string;
}
