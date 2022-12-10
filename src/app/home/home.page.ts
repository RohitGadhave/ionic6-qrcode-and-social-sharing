import { Component } from '@angular/core';
// import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { ToastController } from '@ionic/angular';
import { BarcodeScanner, BarcodeScannerOptions } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  scannedData: any;
  encodedData: any;
  encodeData: any;
  inputData: any;
  scantedDataBackup: any = [];

  model: any = {
    qr_data: 'qwer',
    count: '1234',
    time: '',
    type: 'vip'
  }
  constructor(private socialSharing: SocialSharing, private barcodeScanner: BarcodeScanner, private toastController: ToastController) {
    //  localStorage. setItem(“names”, JSON. stringify(names));
    const scantedDataBackup = localStorage.getItem('scanned-data-backup');
    if (scantedDataBackup) {
      this.scantedDataBackup = JSON.parse(scantedDataBackup);
    }
  }
  scanBarcode() {
    const options: BarcodeScannerOptions = {
      preferFrontCamera: false,
      showFlipCameraButton: true,
      showTorchButton: true,
      torchOn: false,
      prompt: 'Place a barcode inside the scan area',
      resultDisplayDuration: 500,
      formats: 'EAN_13,EAN_8,QR_CODE,PDF_417 ',
      orientation: 'portrait',
    };

    this.barcodeScanner.scan(options).then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.scannedData = barcodeData;
      this.model.qr_data = this.scannedData["text"];
      this.model.time = new Date().toISOString();
      const txt = this.model.qr_data.toLowerCase();
      console.warn(this.model);

      if (txt.includes('vip')) {
        this.model.type = 'VIP'
      } else {
        this.model.type = 'Guest'
      }

    }).catch(err => {
      console.log('Error', err);
    });
  }

  createBarcode() {
    this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE, this.inputData).then((encodedData) => {
      console.log(encodedData);
      this.encodedData = encodedData;
    }, (err) => {
      console.log('Error occured : ' + err);
    });
  }

  unshiftBackupData() {
    const model = this.model;
    console.log(model);

    this.scantedDataBackup.unshift(model);
    localStorage.getItem('scanned-data-backup');
    const scantedDataBackup = JSON.stringify(this.scantedDataBackup);;
    if (scantedDataBackup) {
      localStorage.setItem('scanned-data-backup', scantedDataBackup);
      this.model.qr_data = '';
      this.model.count = '';
      this.scannedData = undefined;
      this.presentToast('Data set successfully');
    }
  }
  shareData() {
    const text = JSON.stringify(this.scantedDataBackup);
    this.socialSharing.shareViaWhatsApp(text).then((res) => {
      // Success
      this.presentToast('Data share successfully');
    }).catch((e) => {
      // Error!
      console.error(e);

      this.presentToast('Error while sharing data', 'danger');
    });
  }
  async presentToast(text: string, color = 'success') {
    const toast = await this.toastController.create({
      message: text,
      duration: 3000,
      cssClass: 'custom-toast',
      position: 'top',
      color,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ],
    });

    await toast.present();
  }
}
