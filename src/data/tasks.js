import { uuid } from "@/functions/uuid";

export default [
    {
        description: "this is the main task!!",
        id: uuid(),
        children: [
            {
                description: "sub task 1",
                id: uuid()
            },
            {
                description: "sub task 2",
                id: uuid()
            },
            {
                description: "sub task 3",
                id: uuid(),
                children: [
                    {
                        description: "sub task 3-1",
                        id: uuid()
                    },
                    {
                        description: "sub task 3-2",
                        id: uuid()
                    }
                ]
            }
        ]
    }
];
