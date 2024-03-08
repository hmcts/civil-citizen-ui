terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.95"
    }
  }
}

provider "azurerm" {
  features {}
}
