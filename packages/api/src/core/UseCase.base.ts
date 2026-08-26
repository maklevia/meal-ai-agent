
export abstract class UseCase<Options, Result> {
    abstract execute(option: Options): Promise<Result>;
}
