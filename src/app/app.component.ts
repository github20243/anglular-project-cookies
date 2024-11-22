import { Component, HostListener } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  currency = "$";
  productsData: any;
  loader = true;
  loaderShowed = true;

  form = this.fb.group({
    product: ["", Validators.required],
    name: ["", Validators.required],
    phone: ["", Validators.required],
  });


  mainImageStyle: any;
  orderImageStyle: any;

  @HostListener("document:mousemove", ["$event"])
  onMouseMove(e: MouseEvent) {
    this.mainImageStyle = { transform: "translate(" + ((e.clientX * 0.3) / 8) + "px," + ((e.clientY * 0.3) / 8) + "px)" };
    this.orderImageStyle = { transform: "translate(-" + ((e.clientX * 0.3) / 8) + "px,-" + ((e.clientY * 0.3) / 8) + "px)" };
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.loaderShowed = false;
    }, 2000);

    setTimeout(() => {
      this.loader = false;
    }, 3000);

    this.http.get("https://testologia.ru/cookies").subscribe(data => this.productsData = data);
  }

  scrollTo(target: HTMLElement, product: any) {
    target.scrollIntoView({ behavior: 'smooth' });

    if (product) {
      this.form.patchValue({ product: product.title + ' (' + product.price + '' + this.currency + ')' });
    }
  }

  switchSugarFree(e: any) {
    this.http.get("https://testologia.ru/cookies" + (e.currentTarget.checked ? '?sugarfree' : ''))
      .subscribe(data => this.productsData = data);
  }

  changeCurrency() {
    let newCurrency = "$";
    let coefficient = 1;

    if (this.currency === "$") {
      newCurrency = "₽";
      coefficient = 90;
    } else if (this.currency === "₽") {
      newCurrency = "BYN";
      coefficient = 3;
    } else if (this.currency === "BYN") {
      newCurrency = "€";
      coefficient = 0.9;
    } else if (this.currency === "€") {
      newCurrency = "¥";
      coefficient = 6.9;
    } else if (this.currency === "¥") {
      newCurrency = "KGS";
      coefficient = 87;
    }

    this.currency = newCurrency;

    this.productsData.forEach((item: any) => {
      item.price = +(item.basePrice * coefficient).toFixed(1);
    });
  }


  confirmOrder() {
    if (this.form.valid) {
      this.http.post("https://testologia.ru/cookies-order", this.form.value).subscribe({
        next: (response: any) => {
          this.toastr.success('Ваш заказ успешно отправлен!', 'Успех 🎉');
          this.form.reset();
        },
        error: (response: any) => {
          this.toastr.error('Что-то пошло не так. Попробуйте еще раз.', 'Ошибка 😞');
        }
      });
    } else {
      this.toastr.warning('Пожалуйста, заполните все поля.', 'Внимание ⚠️');
    }
  }

  showInfo() {
    this.toastr.info('Это тестовое уведомление.', 'Информация ℹ️');
  }
}
