pipeline {
  agent any

  environment {
    APP = "hrms-backend"
    IMAGE = "kartik61/hrms-backend:latest"
  }

  stages {
    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t ${IMAGE} .'
      }
    }

    stage('Trivy Filesystem Scan') {
      steps {
        sh '''
          echo "🔍 Running Trivy FS scan..."
          mkdir -p trivy-fs-reports

          # Optional: check Trivy version
          docker run --rm aquasec/trivy --version

          # Download HTML template for report
          mkdir -p contrib
          curl -sSL -o contrib/html.tpl https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/html.tpl

          # Run Trivy scan and output HTML report
          docker run --rm \
            -v $(pwd):/project \
            -v $(pwd)/contrib:/contrib \
            aquasec/trivy fs /project \
            --severity HIGH,CRITICAL \
            --format template \
            --template "@/contrib/html.tpl" > trivy-fs-reports/trivy-fs-report.html || true
        '''

        // Archive the HTML report
        archiveArtifacts artifacts: 'trivy-fs-reports/trivy-fs-report.html', onlyIfSuccessful: false

        // Publish HTML Report
        publishHTML([
          reportDir: 'trivy-fs-reports',
          reportFiles: 'trivy-fs-report.html',
          reportName: 'Trivy Filesystem Scan Report',
          allowMissing: true,
          alwaysLinkToLastBuild: true,
          keepAll: true
        ])
      }
    }

    stage('Docker Login & Push') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'docker-hub-creds',
          usernameVariable: 'DOCKER_USERNAME',
          passwordVariable: 'DOCKER_PASSWORD'
        )]) {
          sh '''
            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
            docker push ${IMAGE}
          '''
        }
      }
    }

    stage('Docker Run') {
      steps {
        sh 'docker stop ${APP} || true && docker rm ${APP} || true'
        sh 'docker run -d --name ${APP} -p 5203:80 ${IMAGE}'
      }
    }
  }

  post {
    failure {
      echo "❌ Pipeline failed. Check console output."
    }
  }
}
