import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwtToken');

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }
  return next(req);
};

//INTERCEPTOR
//MINDEN http kérés előtt elküldi a tokent a backendnek, hogy az le tudja ellenőrizni a jogosultságokat 
//jelen app-ban ezt úgy lehet tesztelni, hogy ha kikommentezzük ezt az interceptor file-t, létrehozunk egy noteCard-ot és megpróbáljuk elmenteni, akkor hibát fog dobni, mert 
//az interceptor nem tudta elküldeni a backendnek a tokent, így az nem fogja engedni a htttp műveletet (save)
//FONTOS! Ehhez a backendet is úgy kell beállítani  