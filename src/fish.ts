
export interface Guppy {

    cwd: string;
    command: string;
    args: string[];
}

export interface Fish extends Guppy {

    key: string;
}
