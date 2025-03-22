export const load = ({ params }: { params: { username: string } }) => {
    return {
        username: params.username,
    };
};
