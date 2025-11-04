import z from "zod";

export const resultValidation = z.object({
    q_Id:z.string(),
    question:z.string(),
    answer:z.string()
});

export type resultValidationType = z.infer<typeof resultValidation>;
