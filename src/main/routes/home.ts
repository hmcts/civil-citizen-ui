import { Application } from 'express';

export default function(app: Application): void {

  app.get('/', (req, res) => {
    // res.render('home');
    res.render('features/dashboard/dashboard');
  });

}
