terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.75"
    }
  }
}

provider "azurerm" {
  features {}
}
