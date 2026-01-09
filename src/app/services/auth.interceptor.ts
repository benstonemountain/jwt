import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Már nem keressük a tokent a localStorage-ban, mert a sütit a böngésző kezeli.
  // A lényeg, hogy minden kérést klónozunk és beállítjuk a withCredentials-t.
  
  const clonedRequest = req.clone({
    withCredentials: true
  });

  return next(clonedRequest);
};

//INTERCEPTOR (cookie)
//Nincs Authorization header: a Backend most már a sütiből olvassa a tokent (amit a Program.cs-ben beállítottunk az OnMessageReceived eseménynél) --> ezért nem kell manuálisan belegyömöszölni a fejlécbe a Bearer <token>-t
//withCredentials: true --> ez mondja meg az Angularnak, hogy "Kérlek, minden kérésnél, ami a backendre megy, engedd, hogy a böngésző automatikusan hozzácsapja a sütiket is!". Enélkül a süti nem menne el, és a szerver 401 Unauthorized hibát adna.