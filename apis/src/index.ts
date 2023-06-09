import entities from './entities';
import super_api from './super_api';

const PORT_ENTITIES = 3002;
const PORT_SUPER_API = 3001;

entities.listen(PORT_ENTITIES, () => {
    console.log(`Entities server running on port ${PORT_ENTITIES}`);
}).on('error', (err) => {
    console.log(`Error occurred while starting the Entities server: ${err}`);
});

super_api.listen(PORT_SUPER_API, () => {
    console.log(`Super API server running on port ${PORT_SUPER_API}`);
}).on('error', (err) => {
    console.log(`Error occurred while starting the Super API server: ${err}`);
});
