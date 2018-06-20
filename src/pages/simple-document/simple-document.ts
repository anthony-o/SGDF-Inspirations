import { Compiler, Component, NgModule, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { IonicModule, NavController, NavParams } from 'ionic-angular';
import { OpenHomePage } from '../open-home';
import { DataService } from '../../app/data.service';
import { MyApp } from '../../app/app.component';
import { AppModule } from '../../app/app.module';

@Component({
  selector: 'page-simple-document',
  templateUrl: 'simple-document.html',
})
export class SimpleDocumentPage extends OpenHomePage implements OnInit {
  simpleDocumentFileName: string;
  // content$: Observable<SafeHtml>;
  navBarTitle: string;

  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dataService: DataService,
    // private sanitizer: DomSanitizer,
    private compiler: Compiler,
  ) {
    super(navCtrl);
    this.simpleDocumentFileName = this.navParams.get('simpleDocumentFileName');
    // this.content$ = dataService.getSimpleDocumentByFileName(simpleDocumentFileName)
    //   .pipe(map((content) => this.sanitizer.bypassSecurityTrustHtml(content)));
    this.navBarTitle = this.simpleDocumentFileName;
  }

  ngOnInit() {
    this.dataService.getSimpleDocumentByFileName(this.simpleDocumentFileName).subscribe((content) => {
      this.addComponent(content);
    });
  }

  // Création dynamique de template grâce à https://stackoverflow.com/a/39507831/535203
  private addComponent(template: string, properties: any = {}) {
    @Component({template})
    class TemplateComponent {}

    @NgModule({
      declarations: [TemplateComponent],
      imports: [
        AppModule,
        IonicModule.forRoot(MyApp),
      ],
    })
    class TemplateModule {}

    const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
    const factory = mod.componentFactories.find((comp) =>
      comp.componentType === TemplateComponent
    );
    const component = this.container.createComponent(factory);
    Object.assign(component.instance, properties);
    // If properties are changed at a later stage, the change detection
    // may need to be triggered manually:
    // component.changeDetectorRef.detectChanges();
  }
}
