import app from './app';

const port: number = 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});