import { Router } from 'express';
import { tasksController } from "./tasks";

const api = Router()
  .use(tasksController)

export default Router().use('/api', api);
