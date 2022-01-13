import { Application } from 'express';

export default function(app: Application): void {

  app.get('/', (req, res) => {
    res.render('features/dashboard/dashboard');
  });

}
